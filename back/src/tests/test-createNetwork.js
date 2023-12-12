const networksService = require("../services/networks.service");
const { exec } = require("child_process");
const request = require("supertest");
const app = require("../app"); // Replace with the actual path to your Express app
const fs = require("fs");

jest.mock("child_process", () => ({
  exec: jest.fn(),
}));

jest.mock("fs");

describe("Network Services", () => {
  describe("createNetwork", () => {
    it("should form the correct command to create a network", () => {
      const nodesNumber = 5;
      const chainId = 10;
      const expectedCommand = `bash ./exec_network.sh ${nodesNumber} ${chainId}`;

      networksService.createNetwork(nodesNumber, chainId);

      expect(exec).toHaveBeenCalledWith(expectedCommand, expect.any(Function));
    });
  });

  describe("POST /api/redparameters", () => {
    beforeAll(() => {
      const mockRedParameters = JSON.stringify({
        reds: [
          { redId: "red1", nodeCount: 1, chainId: 2222 },
          { redId: "red2", nodeCount: 2, chainId: 3454 },
        ],
      });

      fs.readFileSync.mockReturnValue(mockRedParameters);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it("should create networks for all reds and return success", async () => {
      const response = await request(app).post("/api/redparameters");
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe(
        "Networks have been successfully created for all reds."
      );
    });

    it("should return an error if reds array is not found", async () => {
      fs.readFileSync.mockReturnValueOnce(JSON.stringify({}));

      const response = await request(app).post("/api/redparameters");
      expect(response.statusCode).toBe(500);
      expect(response.body.error).toBe(
        "No reds array found in redParameters.json"
      );
    });
  });
});
