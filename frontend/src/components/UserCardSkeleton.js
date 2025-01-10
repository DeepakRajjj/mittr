import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import styled from 'styled-components';
import { useTheme } from '../context/ThemeContext';

const SkeletonCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: ${props => props.theme.colors.surface};
  border-radius: 8px;
  margin-bottom: 0.5rem;
`;

const UserCardSkeleton = ({ count = 1 }) => {
  const { theme } = useTheme();

  return Array(count).fill(0).map((_, index) => (
    <SkeletonCard key={index} theme={theme}>
      <div style={{ flex: 1 }}>
        <Skeleton
          baseColor={theme.colors.surface}
          highlightColor={theme.colors.textSecondary}
          width={120}
          height={20}
        />
      </div>
      <div style={{ width: 100 }}>
        <Skeleton
          baseColor={theme.colors.surface}
          highlightColor={theme.colors.textSecondary}
          width={80}
          height={30}
        />
      </div>
    </SkeletonCard>
  ));
};

export default UserCardSkeleton;
