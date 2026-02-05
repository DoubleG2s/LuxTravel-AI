

import { SalesService } from "./salesApi";

async function main() {
    console.log("Testing SalesService...");
    try {
        console.log("1. Fetching all sales...");
        const allSales = await SalesService.list();
        console.log(`Found ${allSales.length} records.`);
        if (allSales.length > 0) {
            console.log("Sample:", allSales[0]);
        }

        console.log("\n2. Testing filter by Passenger 'Silva'...");
        const byPassenger = await SalesService.list({ passengerName: "Silva" });
        console.log(`Found ${byPassenger.length} matching 'Silva'.`);
        byPassenger.forEach(s => console.log(`   - ${s.Passageiro} (Reserva: ${s.Reserva})`));

        console.log("\n3. Testing filter by Provider 'CVC' (Mock should have 1)...");
        const byProvider = await SalesService.list({ provider: "CVC" });
        console.log(`Found ${byProvider.length} matching 'CVC'.`);
        byProvider.forEach(s => console.log(`   - ${s.Passageiro} (Fornecedor: ${s.Fornecedor})`));

        console.log("\n4. Testing filter by Specific Date (Data_ida match logic depends on mock)...");
        // Note: Mock logic might be strict. Just calling to ensure no crash.
        const byDate = await SalesService.list({ date: "04/04/2024" });
        console.log(`Querying date '04/04/2024'... Found ${byDate.length} records.`);

    } catch (error) {
        console.error("Test failed:", error);
    }
}

main();

