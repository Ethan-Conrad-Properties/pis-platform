import Link from "next/link";
import SessionTimeout from "../components/common/SessionTimeout";

const links = {
  "Accounting & Finance": [
    {
      label: "Gross Sales Report (Updates Regularly)",
      url: "https://ethanconradprop-my.sharepoint.com/personal/:x:/g/ERmdfbqJD8lEpBaUvVKR5JgBuu9KxULhGqJPLWrwQd1fxw?e=uxbckf",
    },
  ],
  "Regularly Used Forms": [
    {
      label: "Access Controls Report",
      url: "https://ethanconradprop-my.sharepoint.com/personal/:x:/g/EYHEaYZVMR1Biz4vXryxwX0BYLioJ0n1Cj0FVi7kQex2uA?e=YWtMyH",
    },
    {
      label: "Full Service Office Profiles",
      url: "https://ethanconradprop-my.sharepoint.com/personal/:x:/g/EePl0uZIEPRJj1lSnFY2qcwBokct0Gkd8zFNBJ3LpuUbew?e=NNZVZL",
    },
    {
      label: "Backflow Testing Report",
      url: "https://ethanconradprop-my.sharepoint.com/personal/:x:/g/ET0c4-9D7MtPlnmN2ccAtJcBsKbdGy1flNOS6aGR_wySoQ?e=yaseNE",
    },
    {
      label: "Fire Extinguisher Inspection Report",
      url: "https://ethanconradprop-my.sharepoint.com/personal/:x:/g/ERdUbubN6RVPuyLo49mEKb4BRtbftp-i4llXyUNSB3At1A?e=yXSQ2z",
    },
    {
      label: "Fire Sprinkler Inspection Report",
      url: "https://ethanconradprop-my.sharepoint.com/personal/:x:/g/EfqgpDDx4v9MvD-oVL--iDMBVW1GjJRxydKh1R2P-f7vyw?e=53fIJm",
    },
    {
      label: "ECP & ECM Preferred Vendor Contact List",
      url: "https://ethanconradprop-my.sharepoint.com/personal/:x:/g/EQFpBJZBOpFNhLibxc88FmIBq9ed9Lktj6VjCSJEDYRObA?e=j6QycX",
    },
    {
      label: "Restroom Codes Worksheet",
      url: "https://ethanconradprop-my.sharepoint.com/personal/:x:/g/EX3uZBCLe_9EoxxP78wzL-oBbQg59km6Aahx5t0rIty_8w?e=Abrlba",
    },
    {
      label: "Roof Warranties Worksheet",
      url: "https://ethanconradprop-my.sharepoint.com/personal/:x:/g/EYj0-3Y4zStPsgVRnaKybz4B5rEKyXpo-V08R0A5L05UnQ?e=3Fuayz",
    },
    {
      label: "Tenant Roster",
      url: "https://ethanconradprop-my.sharepoint.com/personal/:x:/r/_layouts/15/Doc.aspx?sourcedoc=%7BEA96179F-AFAF-4445-9335-689465C19001%7D&file=Tenant%20Roster.xlsx&action=default&mobileredirect=true",
    },
    {
      label: "Vacancy Cleaning Report",
      url: "https://ethanconradprop-my.sharepoint.com/personal/:x:/g/EW23OlFdbXRAjq9mPUq7Z-8Bzo42x4NX5kbXEThmKnQZyg?e=hXBkn4",
    },
    {
      label: "Lease Expiration Report",
      url: "https://ethanconradprop-my.sharepoint.com/personal/:x:/g/EcWZQdi8eBlEoqdiwoXlBzIBS3_M-nJPsWEKRQer54ZUig",
    },
    {
      label: "Month-to-Month Report",
      url: "https://ethanconradprop-my.sharepoint.com/personal/:x:/g/EUNb6zyNeY1FgAe6y7B8g-gBV9rysZiGxlIIcxoQT_WlhQ",
    },
    {
      label: "Monument Signs – Cost Per Panel Spreadsheet",
      url: "https://ethanconradprop-my.sharepoint.com/personal/:x:/r/_layouts/15/Doc.aspx?sourcedoc=%7B2B760118-34A2-42F8-8F93-4F98E324271E%7D&file=Monument%20Signs%20-%20Costs%20Per%20Panel%20Spreadsheet.xlsx&action=default&mobileredirect=true",
    },
  ],
  "Security Information and Reports": [
    {
      label: "Security Trending Report",
      url: "https://ethanconradprop-my.sharepoint.com/personal/:x:/g/EWiU90ZrTTNLtdC3dtEuYsQBvYnMhGXtAhOJkaTPBlqzHw?e=VVqIap",
    },
    {
      label: "Law Enforcement & Security Contacts",
      url: "https://ethanconradprop-my.sharepoint.com/personal/:x:/g/Ec7iLEiLr4JClJGFNd6nL6UBBywWH1Ji2Q1eh2c-m5--vw?e=FqXeWA",
    },
    {
      label: "Silvertracker Website",
      url: "https://gbps.silvertracker.net/home.aspx",
    },
    {
      label: "Therms Website",
      url: "https://therms.app/profile/",
    },
  ],
  "Useful Websites": [
    {
      label: "3CX Website for Phone System",
      url: "https://ethanconrad.3cx.us/webclient/#/login",
    },
    {
      label: "AVID Utility Login",
      url: "https://avidxcloud.b2clogin.com/avidxcloud.onmicrosoft.com/b2c_1_sign_in/oauth2/v2.0/authorize?response_type=id_token&scope=https%3A%2F%2FAvidXCloud.com%2Favidutility-webapi%2Fread%20https%3A%2F%2FAvidXCloud.com%2Favidutility-webapi%2Fwrite%20https%3A%2F%2FAvidXCloud.com%2Favidutility-webapi%2Fuser_impersonation%20offline_access%20openid%20profile&client_id=8acc6847-e528-419e-b532-d0e17b123c66&redirect_uri=https%3A%2F%2Futilityanalytics.avidxchange.net%2F&state=cf01e4c6-71be-4239-9655-f016d6a6290d&nonce=d83ceee1-d003-4d04-96b1-bece2f12d179&client_info=1&x-client-SKU=MSAL.JS&x-client-Ver=1.2.1&client-request-id=888be2dd-ae50-462f-802f-b9d0f93e37ab&response_mode=fragment",
    },
    {
      label: "AVID Website",
      url: "https://login.avidsuite.com/?to_app=AvidSuite&to_url=https%3a%2f%2favidinbox.avidxchange.net%2f",
    },
    {
      label: "Brivo - Access Controls",
      url: "https://account.brivo.com/global/index.html?useGlobalLogin=true",
    },
    { label: "Knox Box Ordering Website", url: "https://www.knoxbox.com//" },
    { label: "Outlook Web Access", url: "https://outlook.office.com/mail/" },
    {
      label: "Residential Property Information Worksheet",
      url: "https://ethanconradprop-my.sharepoint.com/personal/:x:/r/Property%20Management/Residential%20Property%20Info%20Sheet/Residential%20Property%20Info%20Sheet.xlsx?d=wb4f3c22b449c4e0f8738e5c79deb0ba1&csf=1&e=eovoOi&web=1&wdLOR=c7F61194A-1615-4C1E-B91F-36B0938809E6",
    },
    {
      label: "Sac County - Request A Public Records",
      url: "https://saccounty.nextrequest.com/requests/new",
    },
    {
      label: "Sac County Building Dept / Permits",
      url: "https://actonline.saccounty.gov/CitizenAccess/Default.aspx",
    },
    {
      label: "Ethan Conrad Properties SharePoint",
      url: "https://ethanconradprop-my.sharepoint.com/personal/SitePages/Home.aspx",
    },
    {
      label: "Yardi Login",
      url: "https://ethan32649.yardione.com/Account/Login?ReturnUrl=%2F",
    },
  ],
  "Sold Properties": [
    {
      label: "Property Info Sheet #2 (SOLD Properties ONLY)",
      url: "https://ethanconradprop-my.sharepoint.com/personal/nong_ethanconradprop_com/Documents/Property%20Info%20Sheet%20%232%20SOLD%20Properties%20ONLY.xlsx?web=1&wdLOR=cA180A244-F765-4374-8999-A14446A73F66",
    },
  ],
  Contacts: [
    {
      label:
        "PG&E Rep – Courtney Thompson (Senior Customer Relationship Manager) 916.342.9265",
      url: "mailto:courtney.thompson@pge.com",
    },
  ],
};

export default function ResourcesPage() {
  return (
    <div className="bg-gradient-to-r from-yellow-200 to-orange-200 w-full min-h-screen px-4 md:px-36 pt-8 md:pt-16 pb-4 md:pb-6">
      <SessionTimeout />
      <Link href="/" className="underline text-blue-600 mb-4 block">
        ← Back to Home
      </Link>
      <h1 className="text-3xl font-bold mb-10">Quick Links</h1>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(links).map(([section, sectionLinks]) => (
          <div
            key={section}
            className="bg-white shadow rounded-2xl p-6 flex flex-col border border-gray-100"
          >
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">
              {section}
            </h2>
            <ul className="space-y-2">
              {sectionLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.url}
                    target="_blank"
                    className="text-blue-600 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
