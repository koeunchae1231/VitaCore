import SwiftUI

struct SplashView: View {
    @EnvironmentObject private var appState: AppState

    private let backgroundColor = Color(red: 0.07, green: 0.21, blue: 0.29)
    private let titleColor = Color(red: 0.95, green: 0.90, blue: 0.78)

    var body: some View {
        ZStack {
            backgroundColor
                .ignoresSafeArea()

            VStack(spacing: 0) {

                Spacer()
                    .frame(height: 130)

                VStack(spacing: 0) {
                    VStack(spacing: 0) {
                        Text("HUMAN")
                        Text("PHYSIOLOGY")
                    }
                    .font(.system(size: 40, weight: .heavy))
                    .foregroundColor(titleColor)
                    .multilineTextAlignment(.center)

                    Text("VITACORE")
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundColor(titleColor)
                }

                Image("human_body")
                    .resizable()
                    .scaledToFit()
                    .frame(maxWidth: .infinity)
                    .frame(height: 650, alignment: .bottom)

                Spacer(minLength: 0)
            }
        }
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                appState.route = .codeInput
            }
        }
    }
}

#Preview {
    SplashView()
        .environmentObject(AppState())
}
