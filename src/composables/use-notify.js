import { Notify } from "quasar";

export function useNotify() {
  const notifySuccess = (message) => {
    Notify.create({
      type: "positive",
      message: message || "Erfolgreich !",
    });
  };

  const notifyError = (message) => {
    Notify.create({
      type: "negative",
      message: message || "Fehler !",
      position: "bottom",
    });
  };

  return {
    notifySuccess,
    notifyError,
  };
}
