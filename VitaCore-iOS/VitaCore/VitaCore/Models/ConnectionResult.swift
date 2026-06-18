//
//  ConnectionResult.swift
//  VitaCore
//
//  Created by 김담영 on 3/31/26.
//

import Foundation

struct ConnectionVerifyRequest: Encodable {
    let code: String
    let deviceIdentifier: String
    let deviceName: String
}

struct ConnectionResult: Decodable {
    let message: String?
    let characterId: Int?
    let success: Bool?
    let valid: Bool?
    let verified: Bool?
    let connected: Bool?
    let deviceToken: String?

    enum CodingKeys: String, CodingKey {
        case message
        case characterId
        case success
        case valid
        case verified
        case connected
        case deviceToken
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        message = try? container.decodeIfPresent(String.self, forKey: .message)
        characterId = Self.decodeFlexibleInt(for: .characterId, from: container)
        success = Self.decodeFlexibleBool(for: .success, from: container)
        valid = Self.decodeFlexibleBool(for: .valid, from: container)
        verified = Self.decodeFlexibleBool(for: .verified, from: container)
        connected = Self.decodeFlexibleBool(for: .connected, from: container)
        deviceToken = try? container.decodeIfPresent(String.self, forKey: .deviceToken)
    }

    private static func decodeFlexibleInt(
        for key: CodingKeys,
        from container: KeyedDecodingContainer<CodingKeys>
    ) -> Int? {
        if let value = try? container.decodeIfPresent(Int.self, forKey: key) {
            return value
        }

        if let value = try? container.decodeIfPresent(String.self, forKey: key) {
            return Int(value)
        }

        return nil
    }

    private static func decodeFlexibleBool(
        for key: CodingKeys,
        from container: KeyedDecodingContainer<CodingKeys>
    ) -> Bool? {
        if let value = try? container.decodeIfPresent(Bool.self, forKey: key) {
            return value
        }

        if let value = try? container.decodeIfPresent(String.self, forKey: key) {
            return ["true", "1", "yes", "verified", "connected"].contains(value.lowercased())
        }

        if let value = try? container.decodeIfPresent(Int.self, forKey: key) {
            return value != 0
        }

        return nil
    }

    var isVerified: Bool {
        if let success {
            return success
        }

        if let valid {
            return valid
        }

        if let verified {
            return verified
        }

        if let connected {
            return connected
        }

        return characterId != nil
    }
}
