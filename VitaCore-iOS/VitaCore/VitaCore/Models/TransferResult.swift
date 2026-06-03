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
}

struct MeasurementRequest: Encodable {
    let deviceIdentifier: String
    let vitalType: String
    let value: Int
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
