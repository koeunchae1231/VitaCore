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
    private let healthKitManager: HealthKitManager
    private let tokenStore: DeviceTokenStore
    private let lastSyncedAtKey = "vitacore.lastSyncedAt"
    private let isoFormatter = ISO8601DateFormatter()

    private init(
        apiClient: APIClient = .shared,
        healthKitManager: HealthKitManager = .shared,
        tokenStore: DeviceTokenStore = .shared
    ) {
        self.apiClient = apiClient
        self.healthKitManager = healthKitManager
        self.tokenStore = tokenStore
        self.isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    }

    func transferLatestMeasurements() async -> Bool {
        guard let deviceToken = tokenStore.read() else {
            print("[Transfer] missing device token")
            return false
        }

        let measurements = await healthKitManager.readMeasurements(since: lastSyncedAt)
        guard !measurements.isEmpty else {
            print("[Transfer] no HealthKit measurements available")
            return false
        }

        do {
            let request = MeasurementBatchRequest(
                measurements: measurements.map { measurement in
                    MeasurementBatchItem(
                        vitalType: measurement.vitalType,
                        value: measurement.value,
                        measuredAt: isoFormatter.string(from: measurement.measuredAt)
                    )
                }
            )

            let result: BatchTransferResult = try await apiClient.post(
                path: "/api/measurements/batch",
                body: request,
                bearerToken: deviceToken
            )

            guard result.isSuccessful else {
                print("[Transfer] batch failed: \(result.message ?? "no message")")
                return false
            }

            let syncedAt = result.syncedThrough.flatMap { isoFormatter.date(from: $0) }
                ?? measurements.map(\.measuredAt).max()
            if let syncedAt {
                lastSyncedAt = syncedAt
            }

            print("[Transfer] batch sent successfully")
            return true
        } catch {
            print("[Transfer] failed: \(error.localizedDescription)")
            return false
        }
    }

    var lastSyncedAt: Date {
        get {
            if let saved = UserDefaults.standard.object(forKey: lastSyncedAtKey) as? Date {
                return saved
            }

            return Calendar.current.date(byAdding: .day, value: -1, to: Date()) ?? Date()
        }
        set {
            UserDefaults.standard.set(newValue, forKey: lastSyncedAtKey)
        }
    }
}
