import { getToastApi } from "../../components/ToastManager";
import { getAuthHeaders } from "../../utils/api";
import {
  apiGet,
  apiPost,
  apiRequest
} from "../../utils/apiRequest";

// Mock dependencies
jest.mock("../../utils/api", () => ({
  getAuthHeaders: jest.fn(),
  TokenManager: {
    getInstance: jest.fn(() => ({
      clearToken: jest.fn(),
    })),
  },
}));

jest.mock("../../components/ToastManager", () => ({
  getToastApi: jest.fn(),
}));

jest.mock("../../constants/config", () => ({
  API_BASE_URL: "https://api.example.com",
}));

describe("apiRequest", () => {
  const mockGetAuthHeaders = getAuthHeaders as jest.MockedFunction<
    typeof getAuthHeaders
  >;
  const mockGetToastApi = getToastApi as jest.MockedFunction<
    typeof getToastApi
  >;
  const mockToast = {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
    dismiss: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAuthHeaders.mockResolvedValue({
      "Content-Type": "application/json",
      Authorization: "Bearer test-token",
    });
    mockGetToastApi.mockReturnValue(mockToast);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("error response handling with new envelope format", () => {
    it("extracts error message from error response", async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: "Bad Request",
        headers: new Headers({
          "content-type": "application/json",
        }),
        json: jest.fn().mockResolvedValue({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details: { email: ["is required"] },
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await apiRequest("/test-endpoint", {
        method: "POST",
        data: {},
      });

      expect(result.error).toBe("Invalid input data");
      expect(result.status).toBe(400);
      expect(mockToast.error).toHaveBeenCalledWith("Invalid input data");
    });

    it("includes error code in response when present", async () => {
      const mockResponse = {
        ok: false,
        status: 422,
        statusText: "Unprocessable Entity",
        headers: new Headers({
          "content-type": "application/json",
        }),
        json: jest.fn().mockResolvedValue({
          error: {
            code: "DUPLICATE_ENTRY",
            message: "Email already exists",
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await apiRequest("/test-endpoint");

      expect(result.error).toBe("Email already exists");
      expect(result.errorCode).toBe("DUPLICATE_ENTRY");
      expect(result.status).toBe(422);
    });

    it("includes error details when present", async () => {
      const errorDetails = {
        email: ["is required", "must be valid"],
        password: ["is too short"],
      };

      const mockResponse = {
        ok: false,
        status: 400,
        statusText: "Bad Request",
        headers: new Headers({
          "content-type": "application/json",
        }),
        json: jest.fn().mockResolvedValue({
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: errorDetails,
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await apiRequest("/test-endpoint", {
        method: "POST",
        data: {},
      });

      expect(result.error).toBe("Validation failed");
      expect(result.errorCode).toBe("VALIDATION_ERROR");
      expect(result.errorDetails).toEqual(errorDetails);
      expect(result.status).toBe(400);
    });

    it("handles error response without details", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: "Not Found",
        headers: new Headers({
          "content-type": "application/json",
        }),
        json: jest.fn().mockResolvedValue({
          error: {
            code: "NOT_FOUND",
            message: "Resource not found",
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await apiRequest("/test-endpoint");

      expect(result.error).toBe("Resource not found");
      expect(result.errorCode).toBe("NOT_FOUND");
      expect(result.errorDetails).toBeUndefined();
      expect(result.status).toBe(404);
    });

    it("falls back to HTTP status when error response is malformed", async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: new Headers({
          "content-type": "application/json",
        }),
        json: jest.fn().mockResolvedValue({
          error: {
            // Missing message field
            code: "SERVER_ERROR",
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await apiRequest("/test-endpoint");

      expect(result.error).toBe("HTTP 500: Internal Server Error");
      expect(result.status).toBe(500);
    });

    it("suppresses error toast when silent option is true", async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: "Bad Request",
        headers: new Headers({
          "content-type": "application/json",
        }),
        json: jest.fn().mockResolvedValue({
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await apiRequest("/test-endpoint", { silent: true });

      expect(result.error).toBe("Validation failed");
      expect(mockToast.error).not.toHaveBeenCalled();
    });
  });

  describe("successful responses", () => {
    it("returns data on successful request", async () => {
      const mockData = { id: 1, name: "Test" };
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({
          "content-type": "application/json",
        }),
        json: jest.fn().mockResolvedValue(mockData),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await apiRequest("/test-endpoint");

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeUndefined();
      expect(result.status).toBe(200);
      expect(mockToast.error).not.toHaveBeenCalled();
    });
  });

  describe("convenience methods", () => {
    it("apiGet calls apiRequest with GET method", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({
          "content-type": "application/json",
        }),
        json: jest.fn().mockResolvedValue({ data: "test" }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await apiGet("/test", { page: "1" });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.example.com/test?page=1",
        expect.objectContaining({
          method: "GET",
        }),
      );
    });

    it("apiPost calls apiRequest with POST method and data", async () => {
      const mockResponse = {
        ok: true,
        status: 201,
        headers: new Headers({
          "content-type": "application/json",
        }),
        json: jest.fn().mockResolvedValue({ id: 1 }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await apiPost("/test", { name: "Test" });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.example.com/test",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Test" }),
        }),
      );
    });
  });

  describe("network errors", () => {
    it("handles network errors gracefully", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(
        new Error("Network failure"),
      );

      const result = await apiRequest("/test-endpoint");

      expect(result.error).toBe("Network failure");
      expect(result.status).toBe(0);
      expect(mockToast.error).toHaveBeenCalledWith("Network failure");
    });
  });

  describe("JSON parse errors", () => {
    it("handles invalid JSON responses", async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: new Headers({
          "content-type": "application/json",
        }),
        json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await apiRequest("/test-endpoint");

      expect(result.error).toBe("Invalid JSON response from server");
      expect(result.status).toBe(500);
      expect(mockToast.error).toHaveBeenCalledWith(
        "Invalid JSON response from server",
      );
    });
  });
});
