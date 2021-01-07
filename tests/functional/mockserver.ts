import { MockMakerspaceApi, defaultMatchFunctions } from "makerspace-ts-mock-client";


export function loadMockserver() {
    return new MockMakerspaceApi(
        "http://localhost:3035/api", 
        browser, 
        { matchCriteria: { body: defaultMatchFunctions.jsonBodyIsMatch } }
    );
}