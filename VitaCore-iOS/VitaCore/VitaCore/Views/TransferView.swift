//
//  TransferView.swift
//  VitaCore
//

import SwiftUI

struct TransferView: View {
    @EnvironmentObject private var appState: AppState

    private let backgroundColor = Color(red: 0.07, green: 0.21, blue: 0.29)
    private let titleColor = Color(red: 0.95, green: 0.90, blue: 0.78)
    private let permissionColor = Color(red: 0.72, green: 0.84, blue: 0.95)

    var body: some View {
        ZStack {
            backgroundColor
                .ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer().frame(height: 80)

                Text("VITACORE")
                    .font(.system(size: 40, weight: .heavy))
                    .foregroundColor(titleColor)

                Text("내 건강 정보를 전달할까요?")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundColor(titleColor)
                    .padding(.top, 140)
                    .padding(.horizontal, 40)

                Spacer().frame(height: 60)

                VStack(spacing: 14) {
                    if !appState.hasHealthPermission {
                        Button("건강 데이터 권한 허용하기") {
                            Task {
                                await appState.requestHealthPermission()
                            }
                        }
                        .foregroundColor(permissionColor)
                        .underline()
                    }

                    PrimaryButton(
                        title: appState.isTransferring ? "전달 중..." : "전달"
                    ) {
                        transfer()
                    }
                    .disabled(!appState.hasHealthPermission || appState.isTransferring)
                    .opacity((!appState.hasHealthPermission || appState.isTransferring) ? 0.5 : 1)

                    Group {
                        if let success = appState.transferSuccess {
                            Text(success ? "전달에 성공했습니다!" : "전달에 실패했습니다")
                                .foregroundColor(titleColor)
                                .frame(maxWidth: .infinity, alignment: .leading)
                        } else {
                            Color.clear
                        }
                    }
                    .frame(height: 24)

                    Group {
                        if let date = appState.lastTransferTime {
                            Text("\(formatted(date))")
                                .foregroundColor(titleColor)
                                .frame(maxWidth: .infinity, alignment: .leading)
                        } else {
                            Color.clear
                        }
                    }
                    .frame(height: 20)
                }
                .padding(.horizontal, 80)

                Spacer(minLength: 0)
            }
        }
    }

    private func transfer() {
        Task {
            await appState.transferMeasurements()
        }
    }

    private func formatted(_ date: Date) -> String {
        let f = DateFormatter()
        f.dateFormat = "yyyy.MM.dd HH:mm:ss"
        return f.string(from: date)
    }
}
