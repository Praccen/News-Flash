export declare module WebUtils {
    function GetCookie(cookieName: string): string;
    function SetCookie(cookieName: string, cookieValue: string, daysToLast?: number): void;
    function DeleteCookie(cookieName: string): void;
    function DownloadFile(filename: any, text: any): void;
}
