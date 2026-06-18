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

    func readMeasurements(since startDate: Date) async -> [VitalMeasurement] {
        guard HKHealthStore.isHealthDataAvailable() else {
            return []
        }

        async let heartRate = readHeartRateSamples(since: startDate)
        async let oxygenSaturation = readOxygenSaturationSamples(since: startDate)

        return await (heartRate + oxygenSaturation).sorted { $0.measuredAt < $1.measuredAt }
    }

    private func readLatestHeartRate() async -> VitalMeasurement? {
        guard let type = HKObjectType.quantityType(forIdentifier: .heartRate),
              let sample = await readLatestSample(for: type) else {
            return nil
        }

        let value = sample.quantity.doubleValue(for: HKUnit.count().unitDivided(by: .minute()))
        return VitalMeasurement(
            vitalType: "HR",
            value: Int(value.rounded()),
            measuredAt: sample.endDate
        )
    }

    private func readLatestOxygenSaturation() async -> VitalMeasurement? {
        guard let type = HKObjectType.quantityType(forIdentifier: .oxygenSaturation),
              let sample = await readLatestSample(for: type) else {
            return nil
        }

        let rawValue = sample.quantity.doubleValue(for: .percent())
        let value = rawValue <= 1 ? rawValue * 100 : rawValue
        return VitalMeasurement(
            vitalType: "SPO2",
            value: Int(value.rounded()),
            measuredAt: sample.endDate
        )
    }

    private func readHeartRateSamples(since startDate: Date) async -> [VitalMeasurement] {
        guard let type = HKObjectType.quantityType(forIdentifier: .heartRate) else {
            return []
        }

        let samples = await readSamples(for: type, since: startDate)
        return samples.map { sample in
            let value = sample.quantity.doubleValue(for: HKUnit.count().unitDivided(by: .minute()))
            return VitalMeasurement(
                vitalType: "HR",
                value: Int(value.rounded()),
                measuredAt: sample.endDate
            )
        }
    }

    private func readOxygenSaturationSamples(since startDate: Date) async -> [VitalMeasurement] {
        guard let type = HKObjectType.quantityType(forIdentifier: .oxygenSaturation) else {
            return []
        }

        let samples = await readSamples(for: type, since: startDate)
        return samples.map { sample in
            let rawValue = sample.quantity.doubleValue(for: .percent())
            let value = rawValue <= 1 ? rawValue * 100 : rawValue
            return VitalMeasurement(
                vitalType: "SPO2",
                value: Int(value.rounded()),
                measuredAt: sample.endDate
            )
        }
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

    private func readSamples(for type: HKQuantityType, since startDate: Date) async -> [HKQuantitySample] {
        await withCheckedContinuation { continuation in
            let predicate = HKQuery.predicateForSamples(
                withStart: startDate,
                end: Date(),
                options: .strictEndDate
            )
            let sortDescriptor = NSSortDescriptor(
                key: HKSampleSortIdentifierEndDate,
                ascending: true
            )

            let query = HKSampleQuery(
                sampleType: type,
                predicate: predicate,
                limit: HKObjectQueryNoLimit,
                sortDescriptors: [sortDescriptor]
            ) { _, samples, _ in
                continuation.resume(returning: samples as? [HKQuantitySample] ?? [])
            }

            healthStore.execute(query)
        }
    }
}
