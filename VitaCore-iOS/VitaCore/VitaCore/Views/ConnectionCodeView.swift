import SwiftUI

struct ConnectionCodeView: View {
    @EnvironmentObject private var appState: AppState

    private let backgroundColor = Color(red: 0.07, green: 0.21, blue: 0.29)
    private let titleColor = Color(red: 0.95, green: 0.90, blue: 0.78)
    private let errorColor = Color(red: 0.96, green: 0.52, blue: 0.52)

    var body: some View {
        ZStack {
            backgroundColor
                .ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer().frame(height: 80)

                Text("VITACORE")
                    .font(.system(size: 40, weight: .heavy))
                    .foregroundColor(titleColor)

                VStack(spacing: 12) {
                    Text("연결 코드를 입력하세요")
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundColor(titleColor)

                    CodeTextField(text: $appState.connectionCode)

                    Group {
                        if let error = appState.connectionErrorMessage {
                            Text(error)
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(errorColor)
                                .frame(maxWidth: .infinity, alignment: .leading)
                        } else {
                            Color.clear
                        }
                    }
                    .frame(height: 22)
                }
                .padding(.top, 140)
                .padding(.horizontal, 40)

                Spacer().frame(height: 60)

                PrimaryButton(title: "연결") {
                    connect()
                }
                .padding(.horizontal, 80)

                Spacer(minLength: 0)
            }
        }
        .onChange(of: appState.connectionCode) { _, _ in
            appState.connectionErrorMessage = nil
        }
    }

    private func connect() {
        Task {
            await appState.verifyConnectionCode()
        }
    }
}
