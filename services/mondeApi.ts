import { JsonApiResponse, JsonApiResource, PersonAttributes, TaskAttributes } from "../types";

// --- CONFIGURATION ---
const API_BASE_URL = "https://web.monde.com.br/api/v2";

// CONFIGURATION: Credentials are now pulled from environment variables for security in deployment.
// Fallback values are kept for local development convenience but should be replaced in production.
const CREDENTIALS = {
  login: process.env.MONDE_LOGIN || "[EMAIL_ADDRESS]",
  password: process.env.MONDE_PASSWORD || "[PASSWORD]"
};

// --- HELPER: TEXT NORMALIZATION ---
// Removes accents and converts to lowercase for fuzzy matching
// e.g., "João" -> "joao", "Vitória" -> "vitoria"
const normalizeStr = (str: string): string => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

// --- AUTH SERVICE ---
class AuthService {
  private static token: string | null = null;
  private static tokenPromise: Promise<string> | null = null;

  static async getToken(forceRefresh = false): Promise<string> {
    if (this.token && !forceRefresh) {
      return this.token;
    }

    if (this.tokenPromise && !forceRefresh) {
      return this.tokenPromise;
    }

    this.tokenPromise = this.login();
    try {
      this.token = await this.tokenPromise;
      return this.token;
    } catch (error) {
      this.tokenPromise = null;
      throw error;
    }
  }

  private static async login(): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/tokens`, {
        method: "POST",
        headers: {
          "Accept": "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json"
        },
        body: JSON.stringify({
          data: {
            type: "tokens",
            attributes: CREDENTIALS
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Auth failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.attributes.token;
    } catch (error) {
      console.error("Monde Auth Error:", error);
      throw error;
    }
  }
}

// --- API CLIENT ---
class MondeApiClient {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    let token = await AuthService.getToken();

    const getHeaders = (t: string) => ({
      "Accept": "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      "Authorization": `Bearer ${t}`,
      ...options.headers,
    });

    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: getHeaders(token),
    });

    // Handle Token Expiration (401)
    if (response.status === 401) {
      console.warn("Token expired, refreshing...");
      token = await AuthService.getToken(true);
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: getHeaders(token),
      });
    }

    if (response.status === 204) {
      return {} as T;
    }

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`API Error ${response.status}:`, errorBody);
      throw new Error(`Monde API Error: ${response.status} - ${response.statusText}`);
    }

    const json = await response.json();
    return json;
  }

  static get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "GET" });
  }

  static post<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  static patch<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  static delete(endpoint: string) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

// --- DOMAIN SERVICES ---

export const PeopleService = {
  async list(filterName?: string) {
    // API LIMIT FIX: The API restricts page[size] to a maximum of 50.
    // To maintain a wider search range (100 records) for client-side filtering, 
    // we fetch the first 2 pages in parallel.

    try {
      const p1 = MondeApiClient.get<JsonApiResponse<JsonApiResource[]>>(`/people?page[size]=50&page[number]=1`);
      const p2 = MondeApiClient.get<JsonApiResponse<JsonApiResource[]>>(`/people?page[size]=50&page[number]=2`);

      const [res1, res2] = await Promise.all([p1, p2]);

      const data1 = res1.data || [];
      const data2 = res2.data || [];
      const allData = [...data1, ...data2];

      // Explicitly cast to PersonAttributes
      let people = allData.map(p => ({
        id: p.id,
        ...p.attributes
      })) as (PersonAttributes & { id?: string })[];

      // 2. Client-side "Fuzzy" Filtering
      if (filterName) {
        // Split search term into tokens (e.g. "Joao Silva" -> ["joao", "silva"])
        const searchTokens = normalizeStr(filterName).split(" ").filter(t => t.length > 0);

        people = people.filter(p => {
          if (!p.name || typeof p.name !== 'string') return false;

          const normalizedName = normalizeStr(p.name);

          // Check if ALL search tokens exist in the name.
          return searchTokens.every(token => normalizedName.includes(token));
        });
      }

      return people;
    } catch (error) {
      console.error("PeopleService.list error:", error);
      // If fetching multiple pages fails, try a safe fallback to just page 1
      const res = await MondeApiClient.get<JsonApiResponse<JsonApiResource[]>>(`/people?page[size]=50`);
      return res.data.map(p => ({ id: p.id, ...p.attributes }));
    }
  },

  async create(attributes: PersonAttributes) {
    const payload = {
      data: {
        type: "people",
        attributes: attributes
      }
    };
    const res = await MondeApiClient.post<JsonApiResponse<JsonApiResource>>("/people", payload);
    return { id: res.data.id, ...res.data.attributes };
  },

  async update(id: string, attributes: Partial<PersonAttributes>) {
    const payload = {
      data: {
        id,
        type: "people",
        attributes: attributes
      }
    };
    const res = await MondeApiClient.patch<JsonApiResponse<JsonApiResource>>(`/people/${id}`, payload);
    return { id: res.data.id, ...res.data.attributes };
  }
};

export const TasksService = {
  async list() {
    const res = await MondeApiClient.get<JsonApiResponse<JsonApiResource[]>>("/tasks");
    return res.data.map(t => ({ id: t.id, ...t.attributes }));
  },

  async create(attributes: TaskAttributes) {
    const payload = {
      data: {
        type: "tasks",
        attributes: attributes
      }
    };
    const res = await MondeApiClient.post<JsonApiResponse<JsonApiResource>>("/tasks", payload);
    return { id: res.data.id, ...res.data.attributes };
  },

  async getHistory(taskId: string) {
    const res = await MondeApiClient.get<JsonApiResponse<JsonApiResource[]>>(`/task-historics?filter[task_id]=${taskId}`);
    return res.data.map(h => ({ id: h.id, ...h.attributes }));
  }
};

export const CitiesService = {
  async list(filterName?: string) {
    const query = filterName ? `?filter[name]=${encodeURIComponent(filterName)}` : '';
    const res = await MondeApiClient.get<JsonApiResponse<JsonApiResource[]>>(`/cities${query}`);
    return res.data.map(c => ({ id: c.id, ...c.attributes }));
  }
};