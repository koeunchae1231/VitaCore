//
//  ConnectionManager.swift
//  VitaCore
//
//  Created by 김담영 on 3/31/26.
//

import Foundation
import UIKit

final class ConnectionManager {
    static let shared = ConnectionManager()

    private let deviceIdentifierKey = "vitacore.deviceIdentifier"
    private let apiClient: APIClient
    private let tokenStore: DeviceTokenStore

    private init(
        apiClient: APIClient = .shared,
        tokenStore: DeviceTokenStore = .shared
    ) {
        self.apiClient = apiClient
        self.tokenStore = tokenStore
    }

    var deviceIdentifier: String {
        if let savedIdentifier = UserDefaults.standard.string(forKey: deviceIdentifierKey) {
            return savedIdentifier
        }

        let newIdentifier = UUID().uuidString
        UserDefaults.standard.set(newIdentifier, forKey: deviceIdentifierKey)
        return newIdentifier
    }

    func verify(code: String) async throws -> ConnectionResult {
        let request = ConnectionVerifyRequest(
            code: code,
            deviceIdentifier: deviceIdentifier,
            deviceName: UIDevice.current.name
        )

        let result: ConnectionResult = try await apiClient.post(
            path: "/api/connection-codes/verify",
            body: request
        )

        if let deviceToken = result.deviceToken {
            tokenStore.save(deviceToken)
        }

        return result
    }
}
