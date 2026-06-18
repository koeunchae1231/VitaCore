//
//  TransferResult.swift
//  VitaCore
//
//  Created by 김담영 on 3/31/26.
//

import Foundation

struct VitalMeasurement {
    let vitalType: String
    let value: Int
    let measuredAt: Date
}

struct MeasurementRequest: Encodable {
    let vitalType: String
    let value: Int
    let measuredAt: String
}

struct MeasurementBatchItem: Encodable {
    let vitalType: String
    let value: Int
    let measuredAt: String
}

struct MeasurementBatchRequest: Encodable {
    let measurements: [MeasurementBatchItem]
}

struct TransferResult: Decodable {
    let message: String?
    let measurementId: Int?
    let derivedRrMeasurementId: Int?
    let ignored: Bool?
    let anomalyDetected: Bool?

    var isSuccessful: Bool {
        measurementId != nil || ignored == true
    }
}

struct BatchTransferResult: Decodable {
    let message: String?
    let acceptedCount: Int?
    let ignoredCount: Int?
    let duplicateCount: Int?
    let failedCount: Int?
    let syncedThrough: String?

    var isSuccessful: Bool {
        failedCount == nil || failedCount == 0
    }
}
