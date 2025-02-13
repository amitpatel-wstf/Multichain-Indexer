import { parentPort, workerData } from "worker_threads";
import { getBaseService } from "..";

(async () => {
    try {
        const { address, balances } = workerData;
        // Call the updateUserByAddress method
        await getBaseService().updateUserByAddress(address, balances);
        // Signal success back to the parent thread.
        parentPort?.postMessage({ success: true, address });
    } catch (error: any) {
        // Signal error back to the parent thread.
        parentPort?.postMessage({ success: false, error: error.message });
    }
})(); 