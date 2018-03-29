import { configure } from '@storybook/react'
import { setDefaults } from '@storybook/addon-info'
import './style.css'

setDefaults({
    header: false,
    inline: true,
    propTables: false,
    maxPropObjectKeys: 10000,
    maxPropArrayLength: 10000,
    maxPropStringLength: 10000
})

function loadStories() {
    require('../packages/bar/stories/bar.stories')
    require('../packages/line/stories/line.stories')
    require('../packages/pie/stories/pie.stories')
}

configure(loadStories, module)
