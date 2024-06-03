import MockFeatureFlag from '~stories/MockFeatureFlag';

<MockFeatureFlag mockFlags={{ the_key: true, other_key: true }}>
    <C1 />
    <C2 />
    <C3>
        <C4 />
    </C3>
</MockFeatureFlag>

<MockFeatureFlag mockFlags={{ the_key: true, }}>
    <C1 />
    <C2 />
    <C3>
        <C4 />
    </C3>
</MockFeatureFlag>