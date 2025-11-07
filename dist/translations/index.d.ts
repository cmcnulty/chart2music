import en from "./en";
import de from "./de";
import es from "./es";
import fr from "./fr";
import it from "./it";
export type translationDict = Record<string, string>;
export type translateEvaluators = Record<string, string | number | boolean>;
export { en, de, es, fr, it };
