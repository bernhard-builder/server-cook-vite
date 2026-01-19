declare global {
  interface Window {
    acquireVsCodeApi: () => {
      postMessage: (message: any) => void;
      getState: () => any;
      setState: (state: any) => void;
    };
    SERVER_COOK_CONTEXT: 'sidebar' | 'explorer';
  }
}

class VSCodeAPI {
  private api: ReturnType<typeof window.acquireVsCodeApi> | null = null;
  public context: 'sidebar' | 'explorer' = 'sidebar';

  constructor() {
    if (typeof window !== 'undefined' && window.acquireVsCodeApi) {
      this.api = window.acquireVsCodeApi();
    }
    if (typeof window !== 'undefined' && window.SERVER_COOK_CONTEXT) {
      this.context = window.SERVER_COOK_CONTEXT;
    }
  }

  postMessage(message: any) {
    this.api?.postMessage(message);
  }

  getState() {
    return this.api?.getState();
  }

  setState(state: any) {
    this.api?.setState(state);
  }
}

export const vscode = new VSCodeAPI();
