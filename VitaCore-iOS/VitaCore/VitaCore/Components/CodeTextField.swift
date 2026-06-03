//
//  CodeTextField.swift
//  VitaCore
//
import SwiftUI

struct CodeTextField: View {
    @Binding var text: String

    private let textColor = Color(red: 0.95, green: 0.90, blue: 0.78)
    private let backgroundColor = Color(red: 0.11, green: 0.26, blue: 0.34)

    var body: some View {
        ZStack(alignment: .leading) {

            RoundedRectangle(cornerRadius: 16)
                .fill(backgroundColor)

            RoundedRectangle(cornerRadius: 16)
                .stroke(textColor, lineWidth: 1.2)

            TextField("", text: $text)
                .textInputAutocapitalization(.characters)
                .autocorrectionDisabled(true)
                .keyboardType(.asciiCapable)
                .foregroundColor(textColor)
                .font(.system(size: 18, weight: .semibold))
                .padding(.horizontal, 18)
        }
        .frame(height: 58)
    }
}
