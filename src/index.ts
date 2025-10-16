import app from './app';
import { onDBConnectionsReady } from './modules/db.module';

onDBConnectionsReady(() => {
    app.listen();
});
