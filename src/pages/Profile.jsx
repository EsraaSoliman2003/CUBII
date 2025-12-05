import { useTranslation } from "react-i18next";

export default function Profile() {
  const { t } = useTranslation();

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-primary dark:text-primaryHover">
        {t("profileTitle")}
      </h1>
      <p className="mt-3 text-grayText dark:text-grayTextDark">
        {t("profileDescription")}
      </p>
    </div>
  );
}
