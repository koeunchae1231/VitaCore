//
//  HealthKitManager.swift
//  VitaCore
//
//  Created by 김담영 on 3/31/26.
//

import Foundation
import HealthKit

final class HealthKitManager {
    static let shared = HealthKitManager()

    private let healthStore = HKHealthStore()

    private var readTypes: Set<HKObjectType> {
        var types = Set<HKObjectType>()

        if let heartRate = HKObjectType.quantityType(forIdentifier: .heartRate) {
            types.insert(heartRate)
        }

        if let oxygenSaturation = HKObjectType.quantityType(forIdentifier: .oxygenSaturation) {
            types.insert(oxygenSaturation)
        }

        return types
    }

    private init() {}

    func requestAuthorization() async -> Bool {
        guard HKHealthStore.isHealthDataAvailable(), !readTypes.isEmpty else {
            return false
        }

        do {
            let authorized: Bool = try await withCheckedThrowingContinuation { continuation in
                healthStore.requestAuthorization(toShare: [], read: readTypes) { success, error in
                    if let error {
                        continuation.resume(throwing: error)
                        return
                    }

                    continuation.resume(returning: success)
                }
            }

            return authorized
        } catch {
            return false
        }
    }

    func readLatestMeasurements() async -> [VitalMeasurement] {
        guard HKHealthStore.isHealthDataAvailable() else {
            return []
        }

        async let heartRate = readLatestHeartRate()
        async let oxygenSaturation = readLatestOxygenSaturation()

        return await [heartRate, oxygenSaturation].compactMap { $0 }
    }

    private func readLatestHeartRate() async -> VitalMeasurement? {
        guard let type = HKObjectType.quantityType(forIdentifier: .heartRate),
              let sample = await readLatestSample(for: type) else {
            return nil
        }

        let value = sample.quantity.doubleValue(for: HKUnit.count().unitDivided(by: .minute()))
        return VitalMeasurement(vitalType: "HR", value: Int(value.rounded()))
    }

    private func readLatestOxygenSaturation() async -> VitalMeasurement? {
        guard let type = HKObjectType.quantityType(forIdentifier: .oxygenSaturation),
              let sample = await readLatestSample(for: type) else {
            return nil
        }

        let rawValue = sample.quantity.doubleValue(for: .percent())
        let value = rawValue <= 1 ? rawValue * 100 : rawValue
        return VitalMeasurement(vitalType: "SPO2", value: Int(value.rounded()))
    }

    private func readLatestSample(for type: HKQuantityType) async -> HKQuantitySample? {
        await withCheckedContinuation { continuation in
            let sortDescriptor = NSSortDescriptor(
                key: HKSampleSortIdentifierEndDate,
                ascending: false
            )

            let query = HKSampleQuery(
                sampleType: type,
                predicate: nil,
                limit: 1,
                sortDescriptors: [sortDescriptor]
            ) { _, samples, _ in
                continuation.resume(returning: samples?.first as? HKQuantitySample)
            }

            healthStore.execute(query)
        }
    }
}
