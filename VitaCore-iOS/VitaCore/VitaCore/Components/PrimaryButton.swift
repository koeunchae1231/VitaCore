//
//  PrimaryButton.swift
//  VitaCore
//
import SwiftUI

struct PrimaryButton: View {
    let title: String
    let action: () -> Void

    private let textColor = Color(red: 0.95, green: 0.90, blue: 0.78)
    private let backgroundColor = Color(red: 0.11, green: 0.26, blue: 0.34)

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(textColor)
                .frame(maxWidth: .infinity)
                .frame(height: 58)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(backgroundColor)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(textColor, lineWidth: 1.2)
                )
        }
    }
}
