import { CleanWebpackPlugin } from "clean-webpack-plugin";
import CopyPlugin = require("copy-webpack-plugin");
import TerserPlugin = require("terser-webpack-plugin");
export const mode: string;
export const entry: {
    "k6-keycloak-dataset": string;
    index: string;
};
export namespace output {
    const path: string;
    const libraryTarget: string;
    const filename: string;
}
export namespace resolve {
    const extensions: string[];
}
export namespace module {
    const rules: {
        test: RegExp;
        use: string;
        exclude: RegExp;
    }[];
}
export const target: string;
export const externals: RegExp;
export const devtool: string;
export namespace stats {
    const colors: boolean;
}
export const plugins: (CleanWebpackPlugin | CopyPlugin)[];
export namespace optimization {
    const minimize: boolean;
    const minimizer: TerserPlugin<import("terser").MinifyOptions>[];
}
