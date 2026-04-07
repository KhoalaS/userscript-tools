import { beforeEach, describe, expect, it } from "vitest";
import { IndexedDBStorageLayer } from "./IndexedDBStorageLayer";

type Store = {
    name: "store-1";
    value: {
        count: number;
        id: string;
    };
};

type Store2 = {
    name: "store-2";
    value: {
        some: boolean;
        id: string;
    };
};

describe("IndexedDBStorageLayer", () => {
    let idb: IndexedDBStorageLayer<Store | Store2>;
    beforeEach(async () => {
        idb = new IndexedDBStorageLayer("vitest", window);
        idb.addStore("store-1", {
            indices: [
                {
                    name: "count",
                },
            ],
            keypath: "id",
        });
        idb.addStore("store-2", {
            indices: [
                {
                    name: "some",
                },
            ],
            keypath: "id",
        });

        await idb.open();
    });

    it("should add values to an objectstore", async () => {
        const addResult = await idb.add("store-1", "id-0", {
            id: "id-0",
            count: 0,
        });

        expect(addResult.ok).toBe(true);
    });

    it("should retrieve values from an objectstore", async () => {
        const addResult = await idb.add("store-1", "id-0", {
            id: "id-0",
            count: 0,
        });

        expect(addResult.ok).toBe(true);

        const getResult = await idb.get("store-1", "id-0");
        expect(getResult.ok).toBe(true);
        if (!getResult.ok) {
            throw new Error("an abnormal test situation has occured");
        }

        expect(getResult.value).toEqual({
            id: "id-0",
            count: 0,
        });
    });

    it("should delete values from an objectstore", async () => {
        const addResult = await idb.add("store-1", "id-0", {
            id: "id-0",
            count: 0,
        });

        expect(addResult.ok).toBe(true);

        let getResult = await idb.get("store-1", "id-0");
        expect(getResult.ok).toBe(true);
        if (!getResult.ok) {
            throw new Error("an abnormal test situation has occured");
        }

        expect(getResult.value).toEqual({
            id: "id-0",
            count: 0,
        });

        const deleteResult = await idb.delete("store-1", "id-0");
        expect(deleteResult.ok).toBe(true);

        getResult = await idb.get("store-1", "id-0");
        console.log(getResult);
        expect(getResult.ok).toBe(false);
    });
});
