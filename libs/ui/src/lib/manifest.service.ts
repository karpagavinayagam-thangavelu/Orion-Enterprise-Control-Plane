import { Injectable, signal } from '@angular/core';

export interface RemoteManifest {
    [key: string]: string;
}

@Injectable({
    providedIn: 'root',
})
export class ManifestService {
    private _manifest = signal<RemoteManifest | null>(null);
    readonly manifest = this._manifest.asReadonly();

    async loadManifest() {
        try {
            // In production, this could be a different URL or handled by a proxy
            const response = await fetch('/module-federation.manifest.json');
            const data = await response.json();
            this._manifest.set(data);
            return data;
        } catch (error) {
            console.error('Failed to load module-federation.manifest.json', error);
            return {};
        }
    }

    getRemoteEntry(key: string): string | undefined {
        return this._manifest()?.[key];
    }
}
