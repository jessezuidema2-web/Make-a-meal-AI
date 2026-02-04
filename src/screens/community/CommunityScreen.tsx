import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { CommunityPost } from '../../types';
import { colors, typography, spacing, borders, shadows } from '../../constants/designSystem';

export const CommunityScreen = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPosts = async () => {
    try {
      const { data: postsData, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (user && postsData) {
        // Check which posts the user has liked
        const { data: likesData } = await supabase
          .from('community_likes')
          .select('post_id')
          .eq('user_id', user.id);

        const likedPostIds = new Set((likesData || []).map((l: any) => l.post_id));

        setPosts(
          postsData.map((p: any) => ({
            ...p,
            liked_by_me: likedPostIds.has(p.id),
          }))
        );
      } else {
        setPosts(postsData || []);
      }
    } catch (error) {
      console.error('Error loading community posts:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [])
  );

  const handleLike = async (post: CommunityPost) => {
    if (!user) return;

    const wasLiked = post.liked_by_me;
    const newCount = wasLiked ? post.likes_count - 1 : post.likes_count + 1;

    // Optimistic update
    setPosts(prev =>
      prev.map(p =>
        p.id === post.id
          ? { ...p, liked_by_me: !wasLiked, likes_count: newCount }
          : p
      )
    );

    try {
      if (wasLiked) {
        await supabase
          .from('community_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id);

        await supabase
          .from('community_posts')
          .update({ likes_count: newCount })
          .eq('id', post.id);
      } else {
        await supabase
          .from('community_likes')
          .insert({ user_id: user.id, post_id: post.id });

        await supabase
          .from('community_posts')
          .update({ likes_count: newCount })
          .eq('id', post.id);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update
      setPosts(prev =>
        prev.map(p =>
          p.id === post.id
            ? { ...p, liked_by_me: wasLiked, likes_count: post.likes_count }
            : p
        )
      );
    }
  };

  const renderPost = ({ item }: { item: CommunityPost }) => {
    const timeAgo = getTimeAgo(item.created_at);

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(item.user_name || '?')[0].toUpperCase()}
            </Text>
          </View>
          <View style={styles.postHeaderInfo}>
            <Text style={styles.userName}>{item.user_name}</Text>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
          </View>
        </View>

        {item.recipe_image && (
          <Image source={{ uri: item.recipe_image }} style={styles.postImage} />
        )}

        <View style={styles.postContent}>
          <Text style={styles.recipeName}>{item.recipe_name}</Text>
          {item.caption ? (
            <Text style={styles.caption}>{item.caption}</Text>
          ) : null}
          <Text style={styles.calories}>{item.calories} kcal</Text>
        </View>

        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.likeButton}
            onPress={() => handleLike(item)}
          >
            <Text style={styles.likeIcon}>
              {item.liked_by_me ? '\u2764\uFE0F' : '\uD83E\uDD0D'}
            </Text>
            <Text style={[styles.likeCount, item.liked_by_me && styles.likeCountActive]}>
              {item.likes_count}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <Text style={styles.subtitle}>See what others are cooking</Text>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPosts(); }} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>{'\uD83D\uDC68\u200D\uD83C\uDF73'}</Text>
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>
              Share a recipe to be the first!
            </Text>
          </View>
        }
      />
    </View>
  );
};

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing['3xl'] + spacing.md,
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.heavy,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  postCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borders.radius.xl,
    backgroundColor: colors.white,
    ...shadows.md,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  postHeaderInfo: {
    marginLeft: spacing.md,
  },
  userName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  timeAgo: {
    fontSize: typography.sizes.xs,
    color: colors.text.light,
  },
  postImage: {
    width: '100%',
    height: 220,
    backgroundColor: colors.gray[200],
  },
  postContent: {
    padding: spacing.base,
  },
  recipeName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.heavy,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  caption: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
  },
  calories: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },
  postActions: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.base,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  likeIcon: {
    fontSize: 22,
  },
  likeCount: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    fontWeight: typography.weights.semibold,
  },
  likeCountActive: {
    color: colors.error,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: typography.sizes.base,
    color: colors.text.light,
  },
});
