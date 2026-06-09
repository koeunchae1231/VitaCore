/**
 * ConnectionCodeDisplay
 *
 * 역할:
 * - 연결 코드를 "표시만" 하는 컴포넌트
 *
 * 중요:
 * - code는 여기서 랜덤 생성하지 않음
 * - code는 ConnectionCodePage에서 API로 받아와서 props로 넘김
 */

export default function ConnectionCodeDisplay({
  code,
  remainingTime,
  character,
  createdAt,
  expiresAt,
  isConnected = false,
  device,
  usedAt,
  isLoading = false,
}) {
  const safeCode = code || "--------";
  const digits = safeCode.split("");
  const maskedIdentifier = device?.deviceIdentifier
    ? `${device.deviceIdentifier.slice(0, 4)}****${device.deviceIdentifier.slice(-4)}`
    : "-";

  return (
    <section className="connection-panel">
      <p className="connection-description">
        The current character&apos;s connection code is
      </p>

      <div className="code-box" aria-label="Connection code">
        {digits.map((digit, index) => (
          <span className="code-digit" key={`${digit}-${index}`}>
            {isLoading ? "-" : digit}
          </span>
        ))}
      </div>

      <p className="connection-timer">
        Time remaining until expiration: {remainingTime || "--:--"}
      </p>
      <div className="connection-detail-grid">
        <p>
          <span>Patient</span>
          <strong>{character?.name || "-"}</strong>
        </p>
        <p>
          <span>Created</span>
          <strong>{createdAt ? new Date(createdAt).toLocaleString() : "-"}</strong>
        </p>
        <p>
          <span>Expires</span>
          <strong>{expiresAt ? new Date(expiresAt).toLocaleString() : "-"}</strong>
        </p>
        <p>
          <span>Status</span>
          <strong>{isConnected ? "CONNECTED" : "WAITING"}</strong>
        </p>
        <p>
          <span>Device</span>
          <strong>{device?.deviceName || "-"}</strong>
        </p>
        <p>
          <span>Identifier</span>
          <strong>{maskedIdentifier}</strong>
        </p>
        <p>
          <span>Connected at</span>
          <strong>{usedAt ? new Date(usedAt).toLocaleString() : "-"}</strong>
        </p>
      </div>
      <p className="connection-note">
        iOS app pairing will connect here after the mobile build is ready.
      </p>
    </section>
  );
}
