import SwiftUI

struct ConnectionLoadingView: View {

    private let backgroundColor = Color(red: 0.07, green: 0.21, blue: 0.29)
    private let titleColor = Color(red: 0.95, green: 0.90, blue: 0.78)

    var body: some View {
        ZStack {
            backgroundColor
                .ignoresSafeArea()

            VStack(spacing: 0) {

                Spacer()
                    .frame(height: 80)

                Text("VITACORE")
                    .font(.system(size: 40, weight: .heavy))
                    .foregroundColor(titleColor)

                VStack(spacing: 20) {

                    ProgressView()
                        .progressViewStyle(.circular)
                        .tint(titleColor)
                        .scaleEffect(1.4)

                    Text("연결 중입니다...")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(titleColor)
                }
                .padding(.top, 220)

                Spacer(minLength: 0)
            }
        }
    }
}

#Preview {
    ConnectionLoadingView()
}
