import { FlatList } from "react-native";

export const RelatedArtistsRail: React.FC<RelatedArtistsRailProps> = ({
  artists,
  artist,
}) => {
  const artistsData = useFragment(artistsQuery, artists);

  const space = useSpace();

  if (!artistsData) {
    return null;
  }

  return (
    <Flex>
      <Text pb={4} px={2}>
        Related Artists
      </Text>
      <FlatList
        data={artistsData}
        renderItem={({ item, index }) => (
          <RelatedArtistsRailCell
            relatedArtist={item}
            index={index}
            artist={artist}
          />
        )}
        ItemSeparatorComponent={() => <Spacer x={2} />}
        ListFooterComponent={<Spacer x={4} />}
        keyExtractor={(item) => `related-artists-rail-item-${item.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ marginHorizontal: space(2) }}
      />
    </Flex>
  );
};
