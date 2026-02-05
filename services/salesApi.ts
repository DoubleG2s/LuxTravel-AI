import { GoogleGenAI } from "@google/genai";

// Schema definition based on user request
export interface Sale {
    Venda: number | string;
    Passageiro: string;
    Produto: string;
    Fornecedor: string;
    Data_ida: string;
    Data_volta: string;
    Idade: number | string;
    RG: string;
    Telefone: string;
    Celular: string;
    Data_venda: string;
    Nome_pacote: string;
    Reserva: string;
}

const API_URL = process.env.GOOGLE_SHEETS_API_URL || "";

export class SalesService {
    /**
     * Fetches all sales data from the remote API.
     * Handles 302 redirects if necessary (though simple fetch usually follows them).
     */
    /**
     * Fetches sales data, optionally with query parameters.
     */
    private static async fetchSales(filters: Record<string, string> = {}): Promise<Sale[]> {
        const url = new URL(API_URL);

        // Append filters to URL parameters
        Object.entries(filters).forEach(([key, value]) => {
            if (value) url.searchParams.append(key, value);
        });

        console.log(`[SalesService] Fetching: ${url.toString()}`);

        try {
            const response = await fetch(url.toString(), {
                method: 'GET',
                redirect: 'follow'
            });

            if (!response.ok) {
                console.warn(`SalesService: API responded with status ${response.status}. using mock data.`);
                return this.getMockData(filters);
            }

            // Verify if data is valid JSON
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                console.warn("SalesService: API returned non-JSON content. Using mock data for demonstration.");
                return this.getMockData(filters);
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                if (data && data.result === 'error') {
                    throw new Error(`API Error: ${data.message || 'Unknown error'}`);
                }
                throw new Error("Invalid data format received from API");
            }

            return data as Sale[];
        } catch (error) {
            console.error("SalesService.fetchSales error:", error);
            console.warn("Falling back to mock data due to API failure.");
            return this.getMockData(filters);
        }
    }

    /**
     * Lists sales with supported filters.
     * Supports: Passageiro, Data_ida, Fornecedor, Reserva
     */
    static async list(params: {
        passengerName?: string;
        date?: string;
        provider?: string;
        reservationId?: string;
    } = {}): Promise<Sale[]> {

        const apiFilters: Record<string, string> = {};

        if (params.passengerName) apiFilters['Passageiro'] = params.passengerName;
        if (params.date) apiFilters['Data_ida'] = params.date; // API expects DD/MM/YYYY
        if (params.provider) apiFilters['Fornecedor'] = params.provider;
        if (params.reservationId) apiFilters['Reserva'] = params.reservationId;

        let sales = await this.fetchSales(apiFilters);

        // Normalize dates for display
        sales = sales.map(s => ({
            ...s,
            Data_ida: this.formatDate(s.Data_ida),
            Data_volta: this.formatDate(s.Data_volta),
            Data_venda: this.formatDate(s.Data_venda),
        }));

        return sales;
    }

    private static getMockData(filters: Record<string, string>): Sale[] {
        const allData: Sale[] = [
            {
                Venda: 1001,
                Passageiro: "João Silva",
                Produto: "Pacote Paris",
                Fornecedor: "EuroAdventures",
                Data_ida: "2024-05-10T00:00:00.000Z", // Mocking ISO format that comes from JSON usually
                Data_volta: "2024-05-20T00:00:00.000Z",
                Idade: 35,
                RG: "123456789",
                Telefone: "11999999999",
                Celular: "11988888888",
                Data_venda: "2024-01-15T00:00:00.000Z",
                Nome_pacote: "Paris Romântica",
                Reserva: "RES-001"
            },
            {
                Venda: 1002,
                Passageiro: "Maria Oliveira",
                Produto: "Cruzeiro Caribe",
                Fornecedor: "SeaDreams",
                Data_ida: "2024-07-01T00:00:00.000Z",
                Data_volta: "2024-07-10T00:00:00.000Z",
                Idade: 29,
                RG: "987654321",
                Telefone: "21999999999",
                Celular: "21977777777",
                Data_venda: "2024-02-20T00:00:00.000Z",
                Nome_pacote: "Caribe Dreams",
                Reserva: "RES-002"
            },
            {
                Venda: 1003,
                Passageiro: "Carlos Pereira",
                Produto: "Resort Nordeste",
                Fornecedor: "CVC",
                Data_ida: "2024-04-04T00:00:00.000Z",
                Data_volta: "2024-04-10T00:00:00.000Z",
                Idade: 40,
                RG: "11223344",
                Telefone: "31999998888",
                Celular: "31988887777",
                Data_venda: "2024-03-01T00:00:00.000Z",
                Nome_pacote: "Porto de Galinhas",
                Reserva: "RES-003"
            }
        ];

        // Basic server-side simulation for mock
        return allData.filter(item => {
            if (filters['Passageiro'] && !item.Passageiro.toLowerCase().includes(filters['Passageiro'].toLowerCase())) return false;
            // Note: Date mock matching is tricky because of formats, doing simple string check or exact match
            // In real API the server handles it. Here assuming simple exact match logic if formatted matches.
            if (filters['Fornecedor'] && !item.Fornecedor.toLowerCase().includes(filters['Fornecedor'].toLowerCase())) return false;
            if (filters['Reserva'] && item.Reserva !== filters['Reserva']) return false;
            return true;
        });
    }

    private static formatDate(dateStr: string | number | Date): string {
        if (!dateStr) return "";
        try {
            // Handle Google Sheets date numbers/Excel serial if needed, but assuming ISO string or date string
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return String(dateStr);
            // Enforce DD/MM/YYYY
            return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(d);
        } catch {
            return String(dateStr);
        }
    }
}
