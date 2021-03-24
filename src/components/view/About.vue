<template>
  <v-container fluid>
    <v-layout row wrap>
      <Heading :title="$t('meeting.TITLE')" />
      <Description :description="$t('meeting.end')" />
    </v-layout>
  </v-container>
</template>

<script>
export default {
  metaInfo() {
    return {
      title: this.$store.getters.appTitle,
      titleTemplate: `${this.$t('about.TITLE')} - %s`
    }
  }
}
</script>
