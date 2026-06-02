// frontend/src/components/ConnectionStatusCard.jsx

/**
 * ConnectionStatusCard
 *
 * 역할:
 * - 연결 상태를 "표시만" 하는 컴포넌트
 *
 * 중요:
 * - connected 여부는 여기서 판단하지 않음
 * - 기기 정보는 ConnectionStatusPage에서 API로 받아와서 props로 넘김
 */

export default function ConnectionStatusCard({
  isConnected,
  character,
  deviceName,
  deviceIdentifier,
  connectedAt,
  lastSync,
}) {
  const maskedIdentifier = deviceIdentifier
    ? `${deviceIdentifier.slice(0, 4)}****${deviceIdentifier.slice(-4)}`
    : "-";

  return (
    <section className="connection-panel connection-status-panel">
      <p className="connection-status-title">
        {isConnected ? "YOU ARE CONNECTED!" : "NOT CONNECTED"}
      </p>

      <p className="connection-status-message">
        {isConnected ? "Connected successfully" : "Waiting for device connection"}
      </p>

      <div className="connection-device-info">
        <p>Patient: {character?.name || "-"}</p>
        <p>
          Profile: {character ? `${character.age}/${character.gender} ${character.height}cm ${character.weight}kg` : "-"}
        </p>
        <p>Device: {deviceName || "-"}</p>
        <p>Identifier: {maskedIdentifier}</p>
        <p>Connected at: {connectedAt || "-"}</p>
        <p>Last sync: {lastSync || "-"}</p>
      </div>
    </section>
  );
}
