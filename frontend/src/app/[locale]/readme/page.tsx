import GoBackButton from "../../ui/goBackButton/GoBackButton";
import ToggleBtn from "../../ui/toggleButton/ToggleButton";
import initTranslations from '../../i18n';

export default async function ReadmePage({ params: { locale }}) {
  const { t } = await initTranslations(locale, ['readme']);

  return (
    <div className="px-4 py-16 max-w-3xl mx-auto">
      <ToggleBtn toggleOptions={['english', 'български']}></ToggleBtn>
      <h1 className="text-3xl font-bold mb-4">{t("importantInformation.title")}</h1>
      <p className="mb-4">{t("importantInformation.content.0")}</p>
      <h2 className="text-2xl font-bold mb-2">{t("gettingStarted.title")}</h2>
      <p className="mb-4">{t("gettingStarted.content.0")}</p>
      <ul className="list-disc list-inside mb-4">
        <li>{t("steps.metaMaskWallet")}</li>
        <li>{t("steps.sepoliaNetwork")}</li>
        <li>{t("steps.testEther")}</li>
      </ul>
      <h2 className="text-2xl font-bold mb-2">{t("howToGetTestEther.title")}</h2>
      <p className="mb-4">{t("howToGetTestEther.content.0")}</p>
      <ol className="list-decimal list-inside mb-4">
        <li>{t("howToGetTestEther.steps.0")}</li>
        <li>
          {t("howToGetTestEther.steps.1.0")}
          <a href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia\" target="_blank">
          {t("howToGetTestEther.steps.1.1")}</a>{t("howToGetTestEther.steps.1.2")}</li>
        <li>{t("howToGetTestEther.steps.2")}</li>
        <li>{t("howToGetTestEther.steps.3")}</li>
      </ol>
      <p className="mb-4">{t("participate.content.0")}</p>
      <h2 className="text-2xl font-bold mb-2">{t("needHelp.title")}</h2>
      <p>{t("needHelp.content.0")}</p>
      <GoBackButton path='/'>Go Back</GoBackButton>
    </div>
  );
}