import { QRCodeSVG } from "qrcode.react";
import Header from "./Header";
import { getAppDownloadUrl } from "../utils/appDownloadUrl";

type Props = { appDownloadUrl?: string };

export function CustomerWelcomePage({ appDownloadUrl = import.meta.env.VITE_APP_DOWNLOAD_URL }: Props) {
  const downloadUrl = getAppDownloadUrl(appDownloadUrl);

  return <>
    <Header />
    <main className="status-page customer-welcome">
      <section className="application-form application-success customer-welcome__card">
        <span className="eyebrow">Account created</span>
        <h1>Order from your favourite stores today with Go-Shopper!</h1>
        <p>Your Go-Shopper account is ready. Download our mobile app to explore supermarkets, shop for groceries and get your orders delivered to your doorstep.</p>
        {downloadUrl ? <div className="customer-welcome__download">
          <div className="customer-welcome__qr" aria-label="QR code for the Go-Shopper app download">
            <QRCodeSVG value={downloadUrl} size={196} level="M" includeMargin title="Scan to download Go-Shopper" />
          </div>
          <p className="privacy-note">Scan the QR code with your phone camera or use the button below to download the app.</p>
          <a className="button" href={downloadUrl} target="_blank" rel="noreferrer">Download Go-Shopper App</a>
        </div> : <div className="alert" role="status">
          The app download link is not configured yet. Please check back soon or contact Go-Shopper support.
        </div>}
      </section>
    </main>
  </>;
}
