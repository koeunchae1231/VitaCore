import SwiftUI

struct ContentView: View {
    @StateObject private var appState = AppState()

    var body: some View {
        Group {
            switch appState.route {
            case .splash:
                SplashView()
                    .environmentObject(appState)

            case .codeInput:
                ConnectionCodeView()
                    .environmentObject(appState)

            case .connecting:
                ConnectionLoadingView()
                    .environmentObject(appState)

            case .transfer:
                TransferView()
                    .environmentObject(appState)
            }
        }
    }
}

#Preview {
    ContentView()
}
