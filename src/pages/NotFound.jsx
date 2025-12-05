import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-primary dark:text-primaryHover">
        404
      </h1>
      <p className="mt-3 text-grayText dark:text-grayTextDark">
        {t("notFoundMessage")}
      </p>
      <p className="mt-3 text-grayText dark:text-grayTextDark">
        {t("pageNotExist")}
      </p>
    </div>
  );
}
