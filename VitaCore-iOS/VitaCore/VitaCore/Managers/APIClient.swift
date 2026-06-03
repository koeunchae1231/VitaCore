//
//  APIClient.swift
//  VitaCore
//

import Foundation

enum APIConfig {
    static let productionBaseURL = URL(string: "https://vitacore-backend.onrender.com")!
}

enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case serverError(String)
    case decodingFailed

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "요청 주소가 올바르지 않습니다"
        case .invalidResponse:
            return "서버 응답을 확인할 수 없습니다"
        case .serverError(let message):
            return message.isEmpty ? "서버 요청에 실패했습니다" : message
        case .decodingFailed:
            return "서버 응답을 읽을 수 없습니다"
        }
    }
}

final class APIClient {
    static let shared = APIClient()

    var baseURL = APIConfig.productionBaseURL

    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder

    private init() {
        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = 10
        configuration.timeoutIntervalForResource = 10
        self.session = URLSession(configuration: configuration)
        self.decoder = JSONDecoder()
        self.encoder = JSONEncoder()
    }

    func post<Request: Encodable, Response: Decodable>(
        path: String,
        body: Request
    ) async throws -> Response {
        let cleanPath = path.hasPrefix("/") ? String(path.dropFirst()) : path
        let url = baseURL.appendingPathComponent(cleanPath)
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try encoder.encode(body)

        print("[API] POST \(url.absoluteString)")

        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(for: request)
        } catch {
            print("[API] request failed: \(error)")
            throw error
        }
        guard let httpResponse = response as? HTTPURLResponse else {
            print("[API] invalid response")
            throw APIError.invalidResponse
        }
        print("[API] status code: \(httpResponse.statusCode)")

        guard 200..<300 ~= httpResponse.statusCode else {
            let message = decodeErrorMessage(from: data)
            throw APIError.serverError(message)
        }

        do {
            return try decoder.decode(Response.self, from: data)
        } catch {
            print("[API] decode failed: \(error)")
            throw APIError.decodingFailed
        }
    }

    private func decodeErrorMessage(from data: Data) -> String {
        if let errorResponse = try? decoder.decode(APIErrorResponse.self, from: data),
           let message = errorResponse.message,
           !message.isEmpty {
            return message
        }

        return String(data: data, encoding: .utf8) ?? "요청에 실패했습니다"
    }
}

private struct APIErrorResponse: Decodable {
    let message: String?
}
