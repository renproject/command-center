// styled.d.ts
import "styled-components";
import { ThemeType } from "../../styles/theme";

interface IPalette {
    main: string;
    contrastText: string;
}
declare module "styled-components" {
    export interface DefaultTheme extends ThemeType {}
}
