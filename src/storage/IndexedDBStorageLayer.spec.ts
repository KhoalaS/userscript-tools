import { beforeEach, describe, expect, it } from "vitest";
import { IndexedDBStorageLayer } from "./IndexedDBStorageLayer";
import { StorageLayer } from "./StorageLayer";

describe("IndexedDBStorageLayer", () => {
    let idb: IndexedDBStorageLayer<"store-1">;
    beforeEach(async () => {
        idb = new IndexedDBStorageLayer("vitest", window, [
            {
                name: "store-1",
                keypath: "id",
                indices: [
                    {
                        name: "count",
                        unique: false,
                    },
                ],
            },
        ]);

        await idb.open();
    });

    it("should add values to an objectstore", async () => {
        const addResult = await idb.add(
            "id-0",
            {
                id: "id-0",
                count: 0,
            },
            "store-1",
        );

        expect(addResult.ok).toBe(true);
    });

    it("should retrieve values from an objectstore", async () => {
        const addResult = await idb.add(
            "id-0",
            {
                id: "id-0",
                count: 0,
            },
            "store-1",
        );

        expect(addResult.ok).toBe(true);

        const getResult = await idb.get("id-0", "store-1");
        expect(getResult.ok).toBe(true);
        if (!getResult.ok) {
            throw new Error("an abnormal test situation has occured");
        }

        expect(getResult.value).toEqual({
            id: "id-0",
            count: 0,
        });
    });
});
