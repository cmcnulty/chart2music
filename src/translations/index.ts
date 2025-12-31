// Default language
import en from "./en";

// Translations
import de from "./de";
import es from "./es";
import fr from "./fr";
import it from "./it";
import hmn from "./hmn";

/**
 * A dictionary of messages, which will be used by the i18n formatter
 */
export type translationDict = Record<string, string>;
/**
 * Breakdown item for stacked data
 */
export type StackBreakdownItem = { group: string; value: number };

/**
 * Entities to be interpolated into translations. For example, in the ICU message "hello {world}", the entity is "world".
 * Note: @formatjs/intl only accepts primitive types (string, number, boolean), not objects or arrays.
 * However, custom translationCallback functions can receive complex types like stackBreakdown (array).
 * When using default ICU templates, use pre-formatted strings like stackBreakdownFormatted instead.
 */
export type translateEvaluators = Record<
    string,
    string | number | boolean | StackBreakdownItem[]
>;
export { en, de, es, fr, it, hmn };
