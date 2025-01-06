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

                // Check if token is expired
                if (token.accessTokenExpiresAt < new Date()) {
                    await db.collection('token').deleteOne({ accessToken });
                    return null;
                }

                token.client = client;
                token.user = await db.collection('users').findOne({ _id: token.user_id });
                
                if (!token.user) {
                    await db.collection('token').deleteOne({ accessToken });
                    return null;
                }

                return token;
            } catch (error) {
                console.error('Error getting access token:', error);
                return null;
            }
        },

        async getRefreshToken(refreshToken) {
            try {
                const token = await db.collection('token').findOne({ refreshToken });
                if (!token) {
                    return null;
                }

                // Check if token is expired
                if (token.refreshTokenExpiresAt < new Date()) {
                    await db.collection('token').deleteOne({ refreshToken });
                    return null;
                }

                token.client = client;
                token.user = await db.collection('users').findOne({ _id: token.user_id });

                if (!token.user) {
                    await db.collection('token').deleteOne({ refreshToken });
                    return null;
                }

                return token;
            } catch (error) {
                console.error('Error getting refresh token:', error);
                return null;
            }
        },

        async getUser(username, password) {
            try {
                const user = await db.collection('users').findOne({ 
                    email: username,  
                    active: true
                });

                if (!user) {
                    return null;
                }

                const passwordsMatch = await bcrypt.compare(password, user.password);
                if (!passwordsMatch) {
                    return null;
                }

                return {
                    ...user,
                    username: user.email  
                };
            } catch (error) {
                console.error('Error during user login:', error);
                return null;
            }
        },

        async saveToken(token, client, user) {
            try {
                // Delete 
                await db.collection('token').deleteMany({ 
                    user_id: user._id,
                    $or: [
                        { accessToken: { $exists: true } },
                        { refreshToken: { $exists: true } }
                    ]
                });

                const tokenToSave = {
                    accessToken: token.accessToken,
                    accessTokenExpiresAt: token.accessTokenExpiresAt,
                    refreshToken: token.refreshToken,
                    refreshTokenExpiresAt: token.refreshTokenExpiresAt,
                    user_id: user._id,
                    client: client,
                    user: user
                };

                await db.collection('token').insertOne(tokenToSave);
                return tokenToSave;
            } catch (error) {
                console.error('Error saving token:', error);
                return null;
            }
        },

        async revokeToken(token) {
            try {
                const result = await db.collection('token').deleteOne({ refreshToken: token.refreshToken });
                return result.deletedCount === 1;
            } catch (error) {
                console.error('Error revoking token:', error);
                return false;
            }
        }
    };
}
