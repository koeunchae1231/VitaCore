//
//  AppState.swift
//  VitaCore
//

import SwiftUI
import Combine

@MainActor
final class AppState: ObservableObject {
    
    // 화면
    @Published var route: AppRoute = .splash
    
    // 연결 코드
    @Published var connectionCode: String = ""
    
    // 연결 상태
    @Published var isConnecting: Bool = false
    @Published var connectionFailed: Bool = false
    @Published var isConnected: Bool = false
    
    // 에러
    @Published var connectionErrorMessage: String? = nil
    
    // 권한 상태
    @Published var hasHealthPermission: Bool = false
    
    // 데이터 전달 상태
    @Published var isTransferring: Bool = false
    @Published var transferSuccess: Bool? = nil
    
    // 마지막 전송 시간
    @Published var lastTransferTime: Date? = nil

    private let connectionManager = ConnectionManager.shared
    private let healthKitManager = HealthKitManager.shared
    private let transferManager = TransferManager.shared

    func verifyConnectionCode() async {
        let code = connectionCode.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !code.isEmpty else {
            connectionErrorMessage = "연결 코드를 입력해주세요"
            return
        }

        isConnecting = true
        connectionFailed = false
        isConnected = false
        connectionErrorMessage = nil
        print("[Connection] verify started")
        defer {
            isConnecting = false
            print("[Connection] verify finished")
        }

        do {
            let result = try await connectionManager.verify(code: code)

            if result.isVerified {
                isConnected = true
                connectionFailed = false
                connectionErrorMessage = nil
                print("[Connection] verify succeeded")
                route = .transfer
            } else {
                connectionFailed = true
                connectionErrorMessage = result.message ?? "연결에 실패하였습니다"
            }
        } catch {
            isConnected = false
            connectionFailed = true
            connectionErrorMessage = error.localizedDescription
            print("[Connection] verify failed: \(error)")
        }
    }

    func requestHealthPermission() async {
        hasHealthPermission = await healthKitManager.requestAuthorization()
    }

    func transferMeasurements() async {
        guard hasHealthPermission else {
            transferSuccess = false
            return
        }

        isTransferring = true
        transferSuccess = nil

        let success = await transferManager.transferLatestMeasurements()

        isTransferring = false
        transferSuccess = success

        if success {
            lastTransferTime = Date()
        }
    }
}
