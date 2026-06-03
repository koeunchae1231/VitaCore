//
//  TransferManager.swift
//  VitaCore
//
//  Created by 김담영 on 3/31/26.
//

import Foundation

final class TransferManager {
    static let shared = TransferManager()

    private let apiClient: APIClient
    private let connectionManager: ConnectionManager
    private let healthKitManager: HealthKitManager

    private init(
        apiClient: APIClient = .shared,
        connectionManager: ConnectionManager = .shared,
        healthKitManager: HealthKitManager = .shared
    ) {
        self.apiClient = apiClient
        self.connectionManager = connectionManager
        self.healthKitManager = healthKitManager
    }

    func transferLatestMeasurements() async -> Bool {
        let measurements = await healthKitManager.readLatestMeasurements()
        guard !measurements.isEmpty else {
            print("[Transfer] no HealthKit measurements available")
            return false
        }

        do {
            for measurement in measurements {
                let request = MeasurementRequest(
                    deviceIdentifier: connectionManager.deviceIdentifier,
                    vitalType: measurement.vitalType,
                    value: measurement.value
                )

                let result: TransferResult = try await apiClient.post(
                    path: "/api/measurements",
                    body: request
                )

                guard result.isSuccessful else {
                    print("[Transfer] unexpected response for \(measurement.vitalType): \(result.message ?? "no message")")
                    return false
                }

                print("[Transfer] \(measurement.vitalType) sent successfully")
            }

            return true
        } catch {
            print("[Transfer] failed: \(error.localizedDescription)")
            return false
        }
    }
}
