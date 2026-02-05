import { FunctionDeclaration, Schema, Type } from "@google/genai";
import { PeopleService, TasksService, CitiesService } from "./mondeApi";
import { SalesService } from "./salesApi";

// --- 1. FUNCTION DEFINITIONS (SCHEMA) ---

export const mondeToolsSchema: FunctionDeclaration[] = [
  {
    name: "list_people",
    description: "Lists customers/people from the Monde database. Can filter by name.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        filterName: { type: Type.STRING, description: "Optional name to filter results." }
      }
    }
  },
  {
    name: "create_person",
    description: "Creates a new customer/person in the database.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Full name of the person." },
        email: { type: Type.STRING, description: "Email address." },
        phone: { type: Type.STRING, description: "Phone number." }
      },
      required: ["name"]
    }
  },
  {
    name: "update_person",
    description: "Updates details of an existing person/customer.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING, description: "The ID of the person to update." },
        phone: { type: Type.STRING, description: "New phone number." },
        email: { type: Type.STRING, description: "New email." }
      },
      required: ["id"]
    }
  },
  {
    name: "list_tasks",
    description: "Lists pending tasks from the system.",
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: "create_task",
    description: "Creates a new task.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        description: { type: Type.STRING, description: "Description of the task." },
        due_date: { type: Type.STRING, description: "Due date in YYYY-MM-DD format." }
      },
      required: ["description"]
    }
  },
  {
    name: "list_cities",
    description: "Lists available cities for travel references.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        filterName: { type: Type.STRING, description: "Optional name of city to find." }
      }
    }
  },
  {
    name: "list_sales",
    description: "Lista vendas, passageiros e reservas do sistema. Use para buscar informações sobre viagens, passageiros e datas.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        passengerName: { type: Type.STRING, description: "Nome parcial do passageiro para buscar." }
      }
    }
  }
];

// --- 2. EXECUTION MAP (LOGIC) ---

export const executeMondeTool = async (name: string, args: any): Promise<any> => {
  console.log(`[Tool Execution] Calling ${name} with`, args);

  try {
    switch (name) {
      case "list_people":
        return await PeopleService.list(args.filterName);

      case "create_person":
        return await PeopleService.create({ name: args.name, email: args.email, phone: args.phone });

      case "update_person":
        return await PeopleService.update(args.id, { phone: args.phone, email: args.email });

      case "list_tasks":
        return await TasksService.list();

      case "create_task":
        return await TasksService.create({ description: args.description, due_date: args.due_date });

      case "list_cities":
        return await CitiesService.list(args.filterName);

      case "list_sales":
        return await SalesService.list(args.passengerName);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    console.error(`Tool execution failed for ${name}:`, error);
    return { error: error.message || "Failed to execute operation on Monde API." };
  }
};