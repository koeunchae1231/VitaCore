//
//  StatusMessageView.swift
//  VitaCore
//
import SwiftUI

struct StatusMessageView: View {
    let message: String
    let isSuccess: Bool

    var body: some View {
        Text(message)
            .font(.system(size: 14, weight: .semibold))
            .foregroundColor(isSuccess ? Color.green.opacity(0.95) : Color.red.opacity(0.95))
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.top, 4)
    }
}
