import App from '../../../src/app';
import { app } from '../../../src/modules/db.module';

async function cleanUp() {
    await App.close();
    await app.close();
}

export default cleanUp;
