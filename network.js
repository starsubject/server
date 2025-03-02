import { readFile, writeFile } from "fs/promises";
import { join } from "path";

export default async function handler(req, res) {
    const filePath = join(process.cwd(), "registry.txt");

    if (req.method === "GET") {
        // Return the registry file contents
        try {
            const data = await readFile(filePath, "utf8");
            res.status(200).send(data);
        } catch (error) {
            res.status(500).send("Failed to read registry.");
        }
    } else if (req.method === "POST") {
        // Update the registry with new client entry
        try {
            const { clientIP, description, content } = req.body;
            if (!clientIP || !description || !content) {
                return res.status(400).send("Missing clientIP, description, or content.");
            }

            // Format new entry
            const newEntry = `${clientIP}/${description}/${content}\n`;

            // Read existing data
            let data = await readFile(filePath, "utf8");

            // Update existing entry or add new one
            if (data.includes(`${clientIP}/${description}/`)) {
                data = data.replace(new RegExp(`^${clientIP}/${description}/.*$`, "m"), newEntry.trim());
            } else {
                data += newEntry;
            }

            await writeFile(filePath, data, "utf8");
            res.status(200).send("Registry updated.");
        } catch (error) {
            res.status(500).send("Failed to update registry.");
        }
    } else {
        res.status(405).send("Method Not Allowed.");
    }
}
