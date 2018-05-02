import {HttpClient} from "../http-client";

describe("Test registeredEndpoints with no authentication", function () {

    let http:HttpClient,
        endPoints = {
            getProducts: {
                path: "/products",
                method: "GET"
            },
            getProductById: {
                path: "/products/{id}",
                method: "GET"
            },
            createProduct: {
                path: "/products",
                method: "POST"
            },
            updateProductUsingPut: {
                path: "/products/{id}",
                method: "PUT"
            },
            updateProductUsingPatch: {
                path: "/products/{id}",
                method: "PATCH"
            },
            deleteProduct: {
                path: "/products/{id}",
                method: "DELETE"
            }
        };
    let expectedResponse = [
        {
            "id": 1,
            "name": "Product001",
            "cost": 10,
            "quantity": 1000,
            "locationId": 1,
            "familyId": 1
        },
        {
            "id": 2,
            "name": "Product002",
            "cost": 20,
            "quantity": 2000,
            "locationId": 1,
            "familyId": 2
        },
        {
            "id": 3,
            "name": "Product003",
            "cost": 30,
            "quantity": 3000,
            "locationId": 3,
            "familyId": 2
        },
        {
            "id": 4,
            "name": "Product004",
            "cost": 40,
            "quantity": 4000,
            "locationId": 2,
            "familyId": 3
        }
    ];
    beforeAll(function () {
        http = new HttpClient("http://localhost:5000")
            .registerEndpoints(endPoints);
    });

    it("Test GET method", function () {
        let actualResponse = http.getProducts();

        expect(actualResponse.statusCode).toEqual(200);
        expect(actualResponse.jsonBody.get("0")).toEqual(expectedResponse[0]);
        expect(actualResponse.jsonBody.deepGet("1.name")).toEqual(expectedResponse[1].name);
        expect(actualResponse.jsonBody.pluckFromArrayOfObject("name")).toEqual(expectedResponse.map(p => p["name"]));
        expect(actualResponse.jsonBody.getArrayCount()).toEqual(4);

        expect(actualResponse.jsonBody.pluckFromArrayOfObject("locationId").getSortedArray()).toEqual([1, 1, 2, 3]);
        let filterFunction:any = (arr:any):boolean => arr.locationId == 3;
        expect(actualResponse.jsonBody.filterArray(filterFunction)).toEqual(expectedResponse.filter(filterFunction));
    });

    it("Test GET method with wildcard url", function () {
        let actualResponse = http.getProductById({id: 2});

        expect(actualResponse.jsonBody).toEqual(expectedResponse[1]);
    });

    it("Test POST method without \"Content-Type\"", function () {
        let payload = {
                "id": 5,
                "name": "Product001",
                "cost": 10,
                "quantity": 1000,
                "locationId": 1,
                "familyId": 1
            },
            actualResponse = http.createProduct(null, payload);

        expect(actualResponse.statusCode).toEqual(201);
        expect(actualResponse.jsonBody).toEqual(payload);
        expect(actualResponse.header("Content-Type")).toContain("application/json");
    });

    it("Test POST method with \"Content-Type\"", function () {
        let payload = {
                "id": 6,
                "name": "Product001",
                "cost": 10,
                "quantity": 1000,
                "locationId": 1,
                "familyId": 1
            },
            actualResponse = http.createProduct(null, payload, {
                "Content-Type": "application/json"
            });

        expect(actualResponse.statusCode).toEqual(201);
        expect(actualResponse.jsonBody).toEqual(payload);
        expect(actualResponse.header("Content-Type")).toContain("application/json");
    });

    it("Test PUT method", function () {
        let payload = {
                "id": 1,
                "name": "Product001Edited",
                "cost": 100,
                "quantity": 10000,
                "locationId": 12,
                "familyId": 11
            },
            actualResponse = http.updateProductUsingPut({id: 1}, payload);

        expect(actualResponse.statusCode).toEqual(200);
        expect(actualResponse.jsonBody).toEqual(payload);
        expect(actualResponse.header("Content-Type")).toContain("application/json");
    });

    it("Test PATCH method", function () {
        let payload = {
                "cost": 0,
                "quantity": 0,
            },
            actualResponse = http.updateProductUsingPatch({id: 2}, payload);

        expectedResponse[1].cost = payload.cost;
        expectedResponse[1].quantity = payload.quantity;

        expect(actualResponse.statusCode).toEqual(200);
        expect(actualResponse.jsonBody).toEqual(expectedResponse[1]);
        expect(actualResponse.header("Content-Type")).toContain("application/json");
    });

    it("Test DELETE method", function () {

        let deleteResponse = http.deleteProduct({id: 2});
        let productList = http.getProducts();

        expect(deleteResponse.statusCode).toEqual(200);
        expect(deleteResponse.jsonBody).toEqual({});

        expect(productList.jsonBody.pluckFromArrayOfObject("id")).not.toContain(2);
    });

});