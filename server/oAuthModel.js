import bcrypt from 'bcrypt';

const client = {
    id: 'client',
    grants: ['password', 'refresh_token'],
};

export default function oAuthModel(db) {
    return {
        getClient() {
            return client;
        },

        async getAccessToken(accessToken) {
            try {
                const token = await db.collection('token').findOne({ accessToken });
                if (!token) {
                    return null;
                }

                // Prüfe ob Token abgelaufen ist
                if (token.accessTokenExpiresAt < new Date()) {
                    await db.collection('token').deleteOne({ accessToken });
                    return null;
                }

                token.client = client;
                token.user = await db.collection('user_auth').findOne({ _id: token.user_id });
                
                if (!token.user) {
                    await db.collection('token').deleteOne({ accessToken });
                    return null;
                }

                return token;
            } catch (error) {
                console.error('Fehler beim Abrufen des Access Tokens:', error);
                return null;
            }
        },

        async getRefreshToken(refreshToken) {
            try {
                const token = await db.collection('token').findOne({ refreshToken });
                if (!token) {
                    return null;
                }

                // Prüfe ob Token abgelaufen ist
                if (token.refreshTokenExpiresAt < new Date()) {
                    await db.collection('token').deleteOne({ refreshToken });
                    return null;
                }

                token.client = client;
                token.user = await db.collection('user_auth').findOne({ _id: token.user_id });

                if (!token.user) {
                    await db.collection('token').deleteOne({ refreshToken });
                    return null;
                }

                return token;
            } catch (error) {
                console.error('Fehler beim Abrufen des Refresh Tokens:', error);
                return null;
            }
        },

        async getUser(username, password) {
            try {
                const user = await db.collection('user_auth').findOne({ 
                    username,
                    active: true // Nur aktive Benutzer können sich einloggen
                });

                if (!user) {
                    return null;
                }

                const passwordsMatch = await bcrypt.compare(password, user.password);
                if (!passwordsMatch) {
                    return null;
                }

                return user;
            } catch (error) {
                console.error('Fehler beim Benutzer-Login:', error);
                return null;
            }
        },

        async saveToken(token, client, user) {
            try {
                // Lösche alte Tokens des Benutzers
                await db.collection('token').deleteMany({ 
                    user_id: user._id,
                    $or: [
                        { accessToken: { $exists: true } },
                        { refreshToken: { $exists: true } }
                    ]
                });

                // Speichere neue Tokens
                const accessTokenDoc = {
                    accessToken: token.accessToken,
                    accessTokenExpiresAt: token.accessTokenExpiresAt,
                    user_id: user._id,
                    client_id: client.id,
                    created_at: new Date()
                };

                const refreshTokenDoc = {
                    refreshToken: token.refreshToken,
                    refreshTokenExpiresAt: token.refreshTokenExpiresAt,
                    user_id: user._id,
                    client_id: client.id,
                    created_at: new Date()
                };

                await Promise.all([
                    db.collection('token').insertOne(accessTokenDoc),
                    db.collection('token').insertOne(refreshTokenDoc)
                ]);

                return { ...token, client, user };
            } catch (error) {
                console.error('Fehler beim Speichern der Tokens:', error);
                throw error;
            }
        },

        // Neue Methode zum Löschen von Tokens (Logout)
        async revokeToken(token) {
            try {
                const result = await db.collection('token').deleteOne({ 
                    $or: [
                        { accessToken: token.accessToken },
                        { refreshToken: token.refreshToken }
                    ]
                });
                return result.deletedCount > 0;
            } catch (error) {
                console.error('Fehler beim Löschen des Tokens:', error);
                return false;
            }
        }
    };
}
