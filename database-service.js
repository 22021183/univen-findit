



// database-service.js
class DatabaseService {
    constructor() {
        this.db = firebase.firestore();
        this.auth = firebase.auth();
    }

    // ===== AUTHENTICATION METHODS =====
    async signUp(email, password, userData) {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Save user data to Firestore
            await this.db.collection('users').doc(user.uid).set({
                email: userData.email,
                name: userData.name,
                phone: userData.phone || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                campus: userData.campus || 'Univen'
            });
            
            return user;
        } catch (error) {
            throw new Error(this.getErrorMessage(error));
        }
    }

    async login(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            return userCredential.user;
        } catch (error) {
            throw new Error(this.getErrorMessage(error));
        }
    }

    async logout() {
        try {
            await this.auth.signOut();
        } catch (error) {
            throw new Error(this.getErrorMessage(error));
        }
    }

    getCurrentUser() {
        return this.auth.currentUser;
    }

    onAuthStateChanged(callback) {
        return this.auth.onAuthStateChanged(callback);
    }

    // ===== ITEM MANAGEMENT METHODS =====
    async addItem(itemData) {
        try {
            const user = this.getCurrentUser();
            if (!user) throw new Error('User must be logged in to report items');

            const itemWithUser = {
                ...itemData,
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName || 'Anonymous',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'active',
                matches: []
            };

            const docRef = await this.db.collection('items').add(itemWithUser);
            return { id: docRef.id, ...itemWithUser };
        } catch (error) {
            throw new Error(this.getErrorMessage(error));
        }
    }

    async getRecentItems(limit = 4) {
        try {
            const snapshot = await this.db
                .collection('items')
                .where('status', '==', 'active')
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            throw new Error(this.getErrorMessage(error));
        }
    }

    async searchItems(searchTerm, itemType = null) {
        try {
            let query = this.db.collection('items').where('status', '==', 'active');

            if (itemType) {
                query = query.where('type', '==', itemType);
            }

            const snapshot = await query.get();
            
            // Client-side filtering for better search experience
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const searchLower = searchTerm.toLowerCase();
            return items.filter(item => 
                item.title.toLowerCase().includes(searchLower) ||
                item.category.toLowerCase().includes(searchLower) ||
                item.location.toLowerCase().includes(searchLower) ||
                (item.description && item.description.toLowerCase().includes(searchLower))
            );
        } catch (error) {
            throw new Error(this.getErrorMessage(error));
        }
    }

    async getUserItems(userId) {
        try {
            const snapshot = await this.db
                .collection('items')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            throw new Error(this.getErrorMessage(error));
        }
    }

    async updateItemStatus(itemId, newStatus) {
        try {
            await this.db.collection('items').doc(itemId).update({
                status: newStatus,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            throw new Error(this.getErrorMessage(error));
        }
    }

    // ===== MATCHING SYSTEM =====
    async createMatch(lostItemId, foundItemId) {
        try {
            const user = this.getCurrentUser();
            if (!user) throw new Error('User must be logged in');

            const matchData = {
                lostItemId,
                foundItemId,
                matchedBy: user.uid,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await this.db.collection('matches').add(matchData);
            
            // Update both items with match reference
            await this.db.collection('items').doc(lostItemId).update({
                matches: firebase.firestore.FieldValue.arrayUnion(docRef.id)
            });
            
            await this.db.collection('items').doc(foundItemId).update({
                matches: firebase.firestore.FieldValue.arrayUnion(docRef.id)
            });

            return docRef.id;
        } catch (error) {
            throw new Error(this.getErrorMessage(error));
        }
    }

    async getItemMatches(itemId) {
        try {
            const snapshot = await this.db
                .collection('matches')
                .where('lostItemId', '==', itemId)
                .orWhere('foundItemId', '==', itemId)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            throw new Error(this.getErrorMessage(error));
        }
    }

    // ===== HELPER METHODS =====
    getErrorMessage(error) {
        switch (error.code) {
            case 'auth/email-already-in-use':
                return 'This email is already registered';
            case 'auth/invalid-email':
                return 'Invalid email address';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters';
            case 'auth/user-not-found':
                return 'No account found with this email';
            case 'auth/wrong-password':
                return 'Incorrect password';
            case 'permission-denied':
                return 'You do not have permission to perform this action';
            default:
                return error.message || 'An error occurred';
        }
    }

    // ===== IMAGE HANDLING (Optional - for future enhancement) =====
    async uploadImage(file) {
        // This would use Firebase Storage - implement later
        throw new Error('Image upload not implemented yet');
    }
}

// Create and export singleton instance
const databaseService = new DatabaseService();
window.databaseService = databaseService;





